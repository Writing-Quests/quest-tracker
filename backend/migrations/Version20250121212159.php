<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250121212159 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE connection_user DROP FOREIGN KEY FK_4B83D173A76ED395');
        $this->addSql('ALTER TABLE connection_user DROP FOREIGN KEY FK_4B83D173DD03F01');
        $this->addSql('DROP TABLE connection_user');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE connection_user (connection_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_4B83D173A76ED395 (user_id), INDEX IDX_4B83D173DD03F01 (connection_id), PRIMARY KEY(connection_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE connection_user ADD CONSTRAINT FK_4B83D173A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE connection_user ADD CONSTRAINT FK_4B83D173DD03F01 FOREIGN KEY (connection_id) REFERENCES connection (id) ON UPDATE NO ACTION ON DELETE CASCADE');
    }
}
